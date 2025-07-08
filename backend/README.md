# TBN Radio Backend

TBN 교통방송 React Native 앱을 위한 Spring Boot 백엔드 서버입니다.

## 기능

- **인증 시스템**: JWT 기반 로그인/회원가입
- **방송 정보 스크래핑**: TBN 웹사이트에서 실시간 방송 정보 수집
- **지역별 방송 정보**: 17개 지역별 방송 정보 제공
- **댓글 시스템**: 지역별 댓글 기능 (추후 구현 예정)

## 기술 스택

- **Spring Boot 3.2.0**
- **Spring Security** - 인증 및 보안
- **Spring Data JPA** - 데이터베이스 접근
- **H2 Database** - 인메모리 데이터베이스 (개발용)
- **JWT** - 토큰 기반 인증
- **Jsoup** - HTML 스크래핑
- **Maven** - 빌드 도구

## API 엔드포인트

### 인증 API

- `POST /api/auth/login` - 로그인
- `POST /api/auth/register` - 회원가입

### TBN 방송 정보 API

- `GET /api/tbn/regions` - 모든 지역 정보 조회
- `GET /api/tbn/broadcast/{regionCode}` - 특정 지역 방송 정보 조회

## 실행 방법

### 1. Java 17 설치 확인

```bash
java -version
```

### 2. Maven 설치 확인

```bash
mvn -version
```

### 3. 프로젝트 빌드 및 실행

```bash
# 프로젝트 루트 디렉토리에서
cd backend

# 의존성 다운로드 및 빌드
mvn clean install

# 애플리케이션 실행
mvn spring-boot:run
```

### 4. 서버 접속

- 서버 URL: `http://localhost:8080`
- H2 콘솔: `http://localhost:8080/h2-console`

## 설정

`application.yml` 파일에서 다음 설정을 변경할 수 있습니다:

- **서버 포트**: `server.port`
- **JWT 시크릿**: `jwt.secret`
- **JWT 만료시간**: `jwt.expiration`
- **CORS 설정**: `cors.*`

## 데이터베이스

개발 환경에서는 H2 인메모리 데이터베이스를 사용합니다.

- JDBC URL: `jdbc:h2:mem:testdb`
- 사용자명: `sa`
- 비밀번호: (없음)

## 개발 환경

- **IDE**: IntelliJ IDEA, Eclipse, VS Code
- **Java**: 17 이상
- **Maven**: 3.6 이상

## 배포

프로덕션 환경에서는 다음을 고려하세요:

1. **데이터베이스**: PostgreSQL, MySQL 등 외부 데이터베이스 사용
2. **JWT 시크릿**: 강력한 시크릿 키로 변경
3. **CORS 설정**: 특정 도메인으로 제한
4. **로깅**: 적절한 로깅 설정
5. **모니터링**: 애플리케이션 모니터링 도구 설정
