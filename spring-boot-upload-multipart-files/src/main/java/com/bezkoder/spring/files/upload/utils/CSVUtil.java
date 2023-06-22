package com.bezkoder.spring.files.upload.utils;

import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.List;

public class CSVUtil {
    private static final String CSV_SEPARATOR = ",";

    public static List<String[]> convertMultipartFileToCSV(MultipartFile file) throws IOException {
        List<String[]> rows = new ArrayList<>();

        try (BufferedReader br = new BufferedReader(new InputStreamReader(file.getInputStream()))) {
            String line;
            while ((line = br.readLine()) != null) {
                String[] columns = line.split(CSV_SEPARATOR, -1);
                rows.add(columns);
            }
        }

        return rows;
    }

    public static boolean isColumnEmpty(String[] row, int columnIndex) {
        if (columnIndex >= row.length) {
            return true;
        }

        return StringUtils.isEmpty(row[columnIndex]);
    }

    public static boolean isMaxColumnRowExceeded(List<String[]> rows) {
        int maxRowCount = 50;

        if (rows.size() > maxRowCount) {
            return true;
        }

        return false;
    }
}
