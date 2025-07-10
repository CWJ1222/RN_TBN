package com.rntbn.backend.controller;

import com.rntbn.backend.dto.LoginResponse;
import com.rntbn.backend.dto.GoogleLoginRequest;
import com.rntbn.backend.entity.User;
import com.rntbn.backend.service.JwtService;
import com.rntbn.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.jackson2.JacksonFactory;
import java.util.Collections;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken.Payload;
import com.rntbn.backend.dto.UpdateNicknameRequest;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtService jwtService;

    @PostMapping("/google")
    public ResponseEntity<LoginResponse> googleLogin(@RequestBody GoogleLoginRequest googleLoginRequest) {
        String idToken = googleLoginRequest.getIdToken();
        System.out.println("📥 받은 idToken: " + idToken);

        try {

            NetHttpTransport transport = new NetHttpTransport();
            JacksonFactory jsonFactory = JacksonFactory.getDefaultInstance();

            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(transport, jsonFactory)
                    .setAudience(Collections
                            .singletonList("929637116364-eqsl60da7giesc340fk6evl9e9i4bts2.apps.googleusercontent.com"))
                    .build();

            GoogleIdToken idTokenPayload = verifier.verify(idToken);

            if (idTokenPayload == null) {
                System.out.println("❌ Google token verification failed.");
                return ResponseEntity.badRequest()
                        .body(new LoginResponse(null, null, null, "유효하지 않은 Google ID 토큰입니다."));
            }

            Payload payload = idTokenPayload.getPayload();
            System.out.println("✅ 토큰 payload 이메일: " + payload.getEmail());

            String email = payload.getEmail();
            String name = (String) payload.get("name");
            String picture = (String) payload.get("picture");
            String providerId = payload.getSubject();

            User user = userService.createOrUpdateSocialUser(
                    email,
                    name,
                    picture,
                    "google",
                    providerId);

            String token = jwtService.generateToken(user.getEmail());
            return ResponseEntity.ok(new LoginResponse(token, user.getEmail(), user.getNickname(), "구글 로그인 성공"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new LoginResponse(null, null, null, "구글 로그인 실패: " + e.getMessage()));
        }
    }

    // 닉네임 수정 API
    @PutMapping("/profile/nickname")
    public ResponseEntity<LoginResponse> updateNickname(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody UpdateNicknameRequest request) {
        try {
            // JWT 토큰에서 이메일 추출
            String token = authHeader.replace("Bearer ", "");
            String email = jwtService.extractEmail(token);

            if (email == null) {
                return ResponseEntity.badRequest()
                        .body(new LoginResponse(null, null, null, "유효하지 않은 토큰입니다."));
            }

            // 닉네임 업데이트
            User updatedUser = userService.updateNickname(email, request.getNickname());

            return ResponseEntity.ok(new LoginResponse(
                    token,
                    updatedUser.getEmail(),
                    updatedUser.getNickname(),
                    "닉네임이 성공적으로 수정되었습니다."));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new LoginResponse(null, null, null, "닉네임 수정 실패: " + e.getMessage()));
        }
    }

    @PostMapping("/delete")
    public ResponseEntity<?> softDeleteUser(@RequestBody Map<String, String> req) {
        String email = req.get("email");
        userService.softDeleteUser(email);
        return ResponseEntity.ok(Collections.singletonMap("message", "탈퇴 처리 완료"));
    }

    // (애플 로그인 엔드포인트도 필요시 추가)
}