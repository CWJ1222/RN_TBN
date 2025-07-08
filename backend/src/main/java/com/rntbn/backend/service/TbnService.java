package com.rntbn.backend.service;

import com.rntbn.backend.dto.BroadcastInfo;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class TbnService {

    private static final Map<String, String> REGION_NAMES = new HashMap<>();

    static {
        // 지역별 한글 이름
        REGION_NAMES.put("2", "부산");
        REGION_NAMES.put("3", "광주");
        REGION_NAMES.put("4", "대구");
        REGION_NAMES.put("5", "대전");
        REGION_NAMES.put("6", "경인");
        REGION_NAMES.put("7", "강원");
        REGION_NAMES.put("8", "전북");
        REGION_NAMES.put("9", "울산");
        REGION_NAMES.put("10", "경남");
        REGION_NAMES.put("11", "경북");
        REGION_NAMES.put("12", "제주");
        REGION_NAMES.put("13", "충북");
        REGION_NAMES.put("14", "충남");
    }

    public BroadcastInfo getBroadcastInfo(String regionCode) {
        try {
            String url = "https://www.tbn.or.kr/onair/tbnlive.tbn?area_code=" + regionCode;
            Document doc = Jsoup.connect(url)
                    .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
                    .timeout(10000)
                    .get();

            // 1. 프로그램명 (title)
            String title = "";
            Element forumNameB = doc.selectFirst("p.greeting-text > b#forumName");
            if (forumNameB != null) {
                title = forumNameB.text();
            }

            // 2. MC, 방송시간
            String mc = "";
            String time = "";
            Element span = doc.selectFirst("p.greeting-text > span");
            if (span != null) {
                String spanText = span.text(); // 예: "MC : 강세민 | 방송시간 : 18:05 ~ 19:55"
                // MC 추출
                Pattern mcPattern = Pattern.compile("MC\\s*[:：]\\s*([^|│｜\\n\\r]*)");
                Matcher mcMatcher = mcPattern.matcher(spanText);
                if (mcMatcher.find()) {
                    mc = mcMatcher.group(1).trim();
                }
                // 방송시간 추출
                Pattern timePattern = Pattern.compile("방송시간\\s*[:：]\\s*([0-9:~\\s]+)");
                Matcher timeMatcher = timePattern.matcher(spanText);
                if (timeMatcher.find()) {
                    time = timeMatcher.group(1).trim();
                }
            }

            return new BroadcastInfo(
                    title.isEmpty() ? "정보 없음" : title,
                    mc.isEmpty() ? "정보 없음" : mc,
                    time.isEmpty() ? "정보 없음" : time,
                    regionCode,
                    REGION_NAMES.getOrDefault(regionCode, "알수없음"));
        } catch (Exception e) {
            return new BroadcastInfo("정보 로드 실패", "정보 로드 실패", "정보 로드 실패", regionCode,
                    REGION_NAMES.getOrDefault(regionCode, "알수없음"));
        }
    }

    public Map<String, String> getAllRegions() {
        return new HashMap<>(REGION_NAMES);
    }
}