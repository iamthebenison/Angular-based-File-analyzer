package com.bezkoder.spring.files.upload.Repository;

import com.bezkoder.spring.files.upload.model.CsvData;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CsvDataRepository extends JpaRepository<CsvData, Long>{

}
