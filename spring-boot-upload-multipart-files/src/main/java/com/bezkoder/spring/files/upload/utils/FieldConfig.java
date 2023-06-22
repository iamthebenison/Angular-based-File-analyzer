package com.bezkoder.spring.files.upload.utils;

public class FieldConfig {
    private String name;
    private boolean required;
    private Integer maxLength;
    private String dataType;
    private String dateFormat;
    private boolean unique;
    private String pattern;

    public boolean isRequired() {
        return required;
    }

    public Integer getMaxLength() {
        return maxLength;
    }

    public String getDataType() {
        return dataType;
    }

    public String getDateFormat() {
        return dateFormat;
    }

    public String getName() {
        return name;
    }

    public boolean isUnique() {
        return unique;
    }

    public void setUnique(boolean unique) {
        this.unique = unique;
    }

    public String getPattern() {
        return pattern;
    }

    // Getters and setters
}
