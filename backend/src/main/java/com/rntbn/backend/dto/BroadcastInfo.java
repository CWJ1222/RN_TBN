package com.rntbn.backend.dto;

public class BroadcastInfo {

    private String title;
    private String mc;
    private String time;
    private String regionCode;
    private String regionName;

    // Default constructor
    public BroadcastInfo() {
    }

    // Constructor with parameters
    public BroadcastInfo(String title, String mc, String time, String regionCode, String regionName) {
        this.title = title;
        this.mc = mc;
        this.time = time;
        this.regionCode = regionCode;
        this.regionName = regionName;
    }

    // Getters and Setters
    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getMc() {
        return mc;
    }

    public void setMc(String mc) {
        this.mc = mc;
    }

    public String getTime() {
        return time;
    }

    public void setTime(String time) {
        this.time = time;
    }

    public String getRegionCode() {
        return regionCode;
    }

    public void setRegionCode(String regionCode) {
        this.regionCode = regionCode;
    }

    public String getRegionName() {
        return regionName;
    }

    public void setRegionName(String regionName) {
        this.regionName = regionName;
    }
}