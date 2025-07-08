package com.rntbn.backend.controller;

import com.rntbn.backend.dto.BroadcastInfo;
import com.rntbn.backend.service.TbnService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/tbn")
@CrossOrigin(origins = "*")
public class TbnController {

    @Autowired
    private TbnService tbnService;

    @GetMapping("/regions")
    public ResponseEntity<Map<String, String>> getAllRegions() {
        Map<String, String> regions = tbnService.getAllRegions();
        return ResponseEntity.ok(regions);
    }

    @GetMapping("/broadcast/{regionCode}")
    public ResponseEntity<BroadcastInfo> getBroadcastInfo(@PathVariable String regionCode) {
        try {
            BroadcastInfo info = tbnService.getBroadcastInfo(regionCode);
            return ResponseEntity.ok(info);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}