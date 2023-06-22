package com.bezkoder.spring.files.upload.utils;

import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;

public class XMLUtil {
    public static String convertMultipartFileToXML(MultipartFile file) throws IOException {
        StringBuilder xmlBuilder = new StringBuilder();

        return xmlBuilder.toString();
    }

    public static boolean isColumnEmpty(String[] row, int columnIndex) {
        if (columnIndex >= row.length) {
            return true;
        }

        return StringUtils.isEmpty(row[columnIndex]);
    }
}
