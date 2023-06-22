package com.bezkoder.spring.files.upload.utils;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.type.CollectionType;
import org.springframework.core.io.ClassPathResource;

import java.io.IOException;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

public class CsvValidator {
    private static final String VALIDATION_CONFIG_FILE = "validationConfig.json";
    private String[] headers;

    public String validateCsvHeaders(String[] headers) throws IOException {
        List<FieldConfig> fieldConfigs = loadValidationConfig();
        String message = null;
        List<String> headersList = Arrays.asList(headers);
        for (FieldConfig fieldConfig : fieldConfigs) {
            if (fieldConfig.isRequired() && headersList.contains(fieldConfig.getName()) == false) {
                message = "Validation Error: Field '" + fieldConfig.getName() + "' is required.";
                break;
            }
        }


        return message;

    }

    public String validateCsvRow(String[] csvRow) throws IOException {
        // Load validation configuration
        String message = null;
        List<FieldConfig> fieldConfigs = loadValidationConfig();

        // Perform validation for each field in the CSV row
        for (int i = 0; i < csvRow.length; i++) {
            if (i >= fieldConfigs.size()) {
                // Handle the case when the number of columns in the CSV exceeds the configuration
                break;
            }

            String fieldValue = csvRow[i];
            FieldConfig fieldConfig = fieldConfigs.get(i);

            if (fieldConfig.isRequired() && fieldValue.isEmpty()) {
                // Field is required but is empty
                message = "Validation Error: Field '" + fieldConfig.getName() + "' is required.";
            } else if (fieldConfig.getMaxLength() != null && fieldValue.length() > fieldConfig.getMaxLength()) {
                // Field exceeds the maximum length allowed
                message = "Validation Error: Field '" + fieldConfig.getName() + "' exceeds the maximum length.";
            } else if (!isDataTypeValid(fieldValue, fieldConfig.getDataType())) {
                // Field does not match the expected data type
                message = "Validation Error: Field '" + fieldConfig.getName() + "' has an invalid data type.";
            } else if (fieldConfig.getDataType().equals("date") && !isDateFormatValid(fieldValue, fieldConfig.getDateFormat())) {
                // Field does not match the expected date format
                message = "Validation Error: Field '" + fieldConfig.getName() + "' has an invalid date format.";
            } else if (fieldConfig.getPattern() != null && !fieldValue.matches(fieldConfig.getPattern())) {
                // Field does not match the expected pattern
                message = "Validation Error: Field '" + fieldConfig.getName() + "' has an invalid pattern.";
            }
        }

        return message;
    }

    public List<FieldConfig> loadValidationConfig() throws IOException {
        ObjectMapper objectMapper = new ObjectMapper();
        CollectionType collectionType = objectMapper.getTypeFactory().constructCollectionType(List.class, FieldConfig.class);
        return objectMapper.readValue(new ClassPathResource(VALIDATION_CONFIG_FILE).getFile(), collectionType);
    }

    private boolean isDataTypeValid(String fieldValue, String dataType) {
        switch (dataType) {
            case "string":
                return true;
            case "integer":
                try {
                    Integer.parseInt(fieldValue);
                    return true;
                } catch (NumberFormatException e) {
                    return false;
                }
            case "double":
                try {
                    Double.parseDouble(fieldValue);
                    return true;
                } catch (NumberFormatException e) {
                    return false;
                }
            case "boolean":
                return fieldValue.equalsIgnoreCase("true") || fieldValue.equalsIgnoreCase("false");
            case "date":
                // Implement date validation logic according to the expected date format
                return true;
            default:
                return false;
        }
    }


    public void setHeaders(String[] row) {
        // TODO Auto-generated method stub
        this.headers = row;
    }

    public String[] getHeaders() {
        // TODO Auto-generated method stub
        return headers;
    }


    public static boolean isDateFormatValid(String dateStr, String format) {
        SimpleDateFormat dateFormat = new SimpleDateFormat(format);
        dateFormat.setLenient(false);

        try {
            dateFormat.parse(dateStr);
            return true;
        } catch (ParseException e) {
            return true;
        }
    }
}

