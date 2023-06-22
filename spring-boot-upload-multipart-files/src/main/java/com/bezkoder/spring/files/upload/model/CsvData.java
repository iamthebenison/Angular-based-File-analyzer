package com.bezkoder.spring.files.upload.model;

import jakarta.persistence.*;
import jakarta.persistence.GeneratedValue;


@Entity
@Table(name = "csv_data")
public class CsvData {
    @Id
    @Column(name = "id")
    private Long id;

    private String column1;
    private String column2;
    private String column3;

    // Getters and setters


    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getColumn1() {
        return column1;
    }

    public void setColumn1(String column1) {
        this.column1 = column1;
    }

    public String getColumn2() {
        return column2;
    }

    public void setColumn2(String column2) {
        this.column2 = column2;
    }

    public String getColumn3() {
        return column3;
    }

    public void setColumn3(String column3) {
        this.column3 = column3;
    }
}

