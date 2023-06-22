package com.bezkoder.spring.files.upload.service;

import com.bezkoder.spring.files.upload.Repository.CsvDataRepository;
import com.bezkoder.spring.files.upload.model.CsvData;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class CsvDataService {
    private final CsvDataRepository csvDataRepository;

    @Autowired
    public CsvDataService(CsvDataRepository csvDataRepository) {
        this.csvDataRepository = csvDataRepository;
    }

    public String insertCsvRow(String[] csvRow) {
        CsvData csvData = new CsvData();
        csvData.setColumn1(csvRow[0]);
        csvData.setColumn2(csvRow[1]);
        csvData.setColumn3(csvRow[2]);
        csvDataRepository.save(csvData);

        System.out.println("CSV row inserted successfully!");

        return null;
    }

    public void deleteCsvData() {
        csvDataRepository.deleteAll();
    }
}
