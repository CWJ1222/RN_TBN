package com.rntbn.backend.controller;

import com.rntbn.backend.dto.LoginRequest;
import com.rntbn.backend.dto.LoginResponse;
import com.rntbn.backend.entity.User;
import com.rntbn.backend.service.JwtService;
import com.rntbn.backend.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtService jwtService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest loginRequest) {
        Optional<User> userOpt = userService.findByUsername(loginRequest.getUsername());

        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(new LoginResponse(null, null, "사용자를 찾을 수 없습니다."));
        }

        User user = userOpt.get();

        if (!userService.validatePassword(loginRequest.getPassword(), user.getPassword())) {
            return ResponseEntity.badRequest().body(new LoginResponse(null, null, "비밀번호가 일치하지 않습니다."));
        }

        String token = jwtService.generateToken(user.getUsername());

        return ResponseEntity.ok(new LoginResponse(token, user.getUsername(), "로그인 성공"));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody User user) {
        if (userService.existsByUsername(user.getUsername())) {
            return ResponseEntity.badRequest().body("이미 존재하는 사용자명입니다.");
        }

        if (userService.existsByEmail(user.getEmail())) {
            return ResponseEntity.badRequest().body("이미 존재하는 이메일입니다.");
        }

        User savedUser = userService.save(user);
        return ResponseEntity.ok("회원가입이 완료되었습니다.");
    }
}