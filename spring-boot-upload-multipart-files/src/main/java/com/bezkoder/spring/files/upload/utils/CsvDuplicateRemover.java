package com.bezkoder.spring.files.upload.utils;

import org.springframework.web.multipart.MultipartFile;

import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.*;

public class CsvDuplicateRemover {

    public void removeDuplicates(MultipartFile multipartFile, Path outputFile) throws IOException {
        CsvValidator csvValidator = new CsvValidator();
        List<FieldConfig> fieldConfigs = csvValidator.loadValidationConfig();
        List<String> uniqueColumns = new ArrayList<>();
        int uniqueColumnsCounter = 0;
        for (FieldConfig fieldConfig : fieldConfigs) {
            if (fieldConfig.isUnique()) {
                uniqueColumns.add(fieldConfig.getName().toLowerCase());
                uniqueColumnsCounter++;
            }
        }


        Map<String, Set<String>> uniqueIdMaps = new HashMap<>();
        Map<Integer, String> uniqueIdToColumnMap = new HashMap<>();

        try (BufferedReader reader = new BufferedReader(new InputStreamReader(multipartFile.getInputStream()));
             BufferedWriter writer = Files.newBufferedWriter(outputFile)) {

            String line;
            int counter = 0;
            while ((line = reader.readLine()) != null) {
                String[] row = line.split(",");
                if (counter == 0) {
                    for (int i = 0; i < row.length; i++) {
                        uniqueIdMaps.put(row[i].toLowerCase(), new HashSet<>());
                        if (uniqueColumns.contains(row[i].toLowerCase())) {
                            uniqueIdToColumnMap.put(i, row[i].toLowerCase());
                        }
                    }
                    // Step 1: Create a new array with length one greater
                    String[] headers = new String[row.length + 1];

                    // Step 2: Assign the new element to the first index
                    headers[0] = "id";

                    // Step 3: Shift existing elements to the right
                    counter = shiftRows(writer, counter, row, headers);
                    continue;
                }

                boolean isUnique = false;
                for (int i = 0; i < row.length; i++) {
                    if (uniqueIdToColumnMap.containsKey(i)) {
                        if (!uniqueIdMaps.get(uniqueIdToColumnMap.get(i)).contains(row[i].toLowerCase())) {
                            isUnique = true;
                            uniqueIdMaps.get(uniqueIdToColumnMap.get(i)).add(row[i].toLowerCase());
                        }
                    }
                }
                if (isUnique) {
                    String[] array = new String[row.length + 1];
                    array[0] = String.valueOf(counter);
                    counter = shiftRows(writer, counter, row, array);
                } else {
                    System.out.println("Duplicate row found: " + line);
                    Files.deleteIfExists(outputFile);
                    throw new RuntimeException("Duplicate row found: " + line);
                }
            }

            System.out.println("Duplicate rows removed successfully!");
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    private int shiftRows(BufferedWriter writer, int counter, String[] row, String[] array) throws IOException {
        String line;
        for (int i = 0; i < row.length; i++) {
            array[i + 1] = row[i];
        }

        line = String.join(",", array);
        writer.write(line);
        writer.newLine();
        counter = counter + 1;
        return counter;
    }


}
