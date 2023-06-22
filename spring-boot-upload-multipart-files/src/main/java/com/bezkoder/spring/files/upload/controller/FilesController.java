package com.bezkoder.spring.files.upload.controller;

import java.util.List;
import java.util.stream.Collectors;

import com.bezkoder.spring.files.upload.service.CsvDataService;
import com.bezkoder.spring.files.upload.utils.CSVUtil;
import com.bezkoder.spring.files.upload.utils.CsvValidator;
import com.bezkoder.spring.files.upload.utils.XMLUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.mvc.method.annotation.MvcUriComponentsBuilder;

import com.bezkoder.spring.files.upload.message.ResponseMessage;
import com.bezkoder.spring.files.upload.model.FileInfo;
import com.bezkoder.spring.files.upload.service.FilesStorageService;

@Controller
@CrossOrigin("http://localhost:8081")
public class FilesController {

    @Autowired
    FilesStorageService storageService;

    @Autowired
    CsvDataService csvDataService;

    @PostMapping("/upload")
    public ResponseEntity<ResponseMessage> uploadFile(@RequestParam("file") MultipartFile file) {
        String message = "";
        try {
            ResponseEntity<ResponseMessage> EXPECTATION_FAILED = getResponseMessageResponseEntity(file);
            if (EXPECTATION_FAILED != null) return EXPECTATION_FAILED;

            if (file.getContentType().contains("text/csv")) {
                CsvValidator csvValidator = new CsvValidator();
                List<String[]> rows = CSVUtil.convertMultipartFileToCSV(file);
                //check for maximum of 20 columns
                if (CSVUtil.isMaxColumnRowExceeded(rows)) {
                    message = "Maximum of 50 rows are allowed";
                    return ResponseEntity.status(HttpStatus.EXPECTATION_FAILED).body(new ResponseMessage(message));
                }
                int rowIndex = 0;
                //validating headers are present in csv
                for (String[] row : rows) {
                    if (rowIndex == 0 && !CSVUtil.isColumnEmpty(row, rowIndex)) {
                        // add headers row to map
                        csvValidator.setHeaders(row);
                        if (csvValidator.validateCsvHeaders(row) != null) {
                            message = csvValidator.validateCsvHeaders(row);
                            return ResponseEntity.status(HttpStatus.EXPECTATION_FAILED).body(new ResponseMessage(message));
                        }
                        rowIndex++;
                        continue;

                    }

                    for (int columnIndex = 0; columnIndex < row.length; columnIndex++) {
                        if (!CSVUtil.isColumnEmpty(row, columnIndex)) {
                            // Process non-empty column
                            if (csvValidator.validateCsvRow(row) != null) {
                                message = csvValidator.validateCsvRow(row);
                                return ResponseEntity.status(HttpStatus.EXPECTATION_FAILED).body(new ResponseMessage(message));
                            }
                        }
                    }

                    rowIndex++;

                }
            }

            if (file.getContentType().contains("text/xml") || file.getContentType().contains("application/xml")) {
                String xml = XMLUtil.convertMultipartFileToXML(file);
            }


            storageService.save(file);

            message = "Uploaded the file successfully: " + file.getOriginalFilename();
            return ResponseEntity.status(HttpStatus.OK).body(new ResponseMessage(message));
        } catch (Exception e) {
            message = "Could not upload the file: " + file.getOriginalFilename() + ". Error: " + e.getMessage();
            return ResponseEntity.status(HttpStatus.EXPECTATION_FAILED).body(new ResponseMessage(message));
        }
    }

    private ResponseEntity<ResponseMessage> getResponseMessageResponseEntity(MultipartFile file) {
        String message;
        //check if file is empty
        if (file.isEmpty()) {
            message = "File is empty!";
            return ResponseEntity.status(HttpStatus.EXPECTATION_FAILED).body(new ResponseMessage(message));
        }
        //check if file is less than 10mb in size
        if (file.getSize() > 10485760) {
            message = "File size too large!";
            return ResponseEntity.status(HttpStatus.EXPECTATION_FAILED).body(new ResponseMessage(message));
        }
        //check if file is a XLSX, XLSM, CSV, and XML
        if (!file.getContentType().contains("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") &&
                !file.getContentType().contains("application/vnd.ms-excel") &&
                !file.getContentType().contains("text/csv") &&
                !file.getContentType().contains("text/xml") &&
                !file.getContentType().contains("application/xml")) {
            message = "File must be a XLSX, XLSM, CSV, and XML!";
            return ResponseEntity.status(HttpStatus.EXPECTATION_FAILED).body(new ResponseMessage(message));
        }
        return null;
    }

    @GetMapping("/files")
    public ResponseEntity<List<FileInfo>> getListFiles() {
        List<FileInfo> fileInfos = storageService.loadAll().map(path -> {
            String filename = path.getFileName().toString();
            String url = MvcUriComponentsBuilder
                    .fromMethodName(FilesController.class, "getFile", path.getFileName().toString()).build().toString();

            return new FileInfo(filename, url);
        }).collect(Collectors.toList());

        return ResponseEntity.status(HttpStatus.OK).body(fileInfos);
    }

    @GetMapping("/files/{filename:.+}")
    public ResponseEntity<Resource> getFile(@PathVariable String filename) {
        Resource file = storageService.load(filename);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + file.getFilename() + "\"").body(file);
    }

    @DeleteMapping("/files/{filename:.+}")
    public ResponseEntity<ResponseMessage> deleteFile(@PathVariable String filename) {
        String message = "";

        try {
            boolean existed = storageService.delete(filename);

            if (existed) {
                message = "Delete the file successfully: " + filename;
                return ResponseEntity.status(HttpStatus.OK).body(new ResponseMessage(message));
            }

            message = "The file does not exist!";
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ResponseMessage(message));
        } catch (Exception e) {
            message = "Could not delete the file: " + filename + ". Error: " + e.getMessage();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ResponseMessage(message));
        }
    }
}
