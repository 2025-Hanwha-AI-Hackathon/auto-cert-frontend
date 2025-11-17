# CORS 문제 해결 방법

## 개발 환경
개발 환경에서는 Vite의 프록시 설정을 사용하여 CORS 문제를 해결합니다.

`vite.config.ts`에 프록시 설정이 추가되어 있으며, 개발 서버 실행 시 자동으로 `/api/*` 요청을 백엔드 서버로 프록시합니다.

### 사용 방법
1. 개발 서버 실행: `npm run dev`
2. API 호출은 `/api/v1/...`로 자동 프록시됩니다.

## 프로덕션 환경
프로덕션 환경에서는 백엔드 서버에서 CORS 설정이 필요합니다.

### 백엔드에서 해야 할 작업
백엔드 서버(Spring Boot)에서 다음 CORS 설정을 추가해야 합니다:

```java
@Configuration
public class CorsConfig {
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**")
                    .allowedOrigins(
                        "https://2025-Hanwha-AI-Hackathon.github.io",
                        "http://localhost:3000"
                    )
                    .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                    .allowedHeaders("*")
                    .allowCredentials(true);
            }
        };
    }
}
```

또는 컨트롤러에서 직접 설정:

```java
@CrossOrigin(origins = {
    "https://2025-Hanwha-AI-Hackathon.github.io",
    "http://localhost:3000"
})
@RestController
@RequestMapping("/api/v1")
public class CertificateController {
    // ...
}
```

## 현재 설정
- **개발 환경**: Vite 프록시 사용 (`/api/*` → 백엔드 서버)
- **프로덕션 환경**: 직접 백엔드 URL 사용 (`https://auto-cert-backend-production.up.railway.app`)

## 문제 해결
CORS 에러가 계속 발생하는 경우:

1. 브라우저 캐시 삭제 후 재시도
2. 개발 서버 재시작 (`npm run dev`)
3. 백엔드 서버의 CORS 설정 확인
4. 브라우저 콘솔에서 정확한 에러 메시지 확인

