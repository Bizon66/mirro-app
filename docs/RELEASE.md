# Випуск оновлень

## Один раз: ключ завантаження (upload key)

Ключ підтверджує, що оновлення від вас. Ви його створюєте один раз і нікому не показуєте. Ні в репозиторій, ні в
чат він не потрапляє.

1. На своєму компʼютері (потрібна Java):
   ```bash
   keytool -genkeypair -v -keystore upload.jks -alias upload -keyalg RSA -keysize 4096 -validity 10000
   ```
2. Збережіть `upload.jks` і паролі в менеджері паролів **і** ще в одному надійному місці. Без ключа оновлення
   не випустити (у Google Play його можна скинути через підтримку, але це довго).
3. У Google Play Console увімкніть **Play App Signing**: Google зберігає головний ключ підпису, ваш —
   лише для завантаження.
4. Додайте секрети в GitHub → Settings → Secrets and variables → Actions:
   - `ANDROID_KEYSTORE_BASE64` — вміст `base64 -w0 upload.jks`
   - `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS` (`upload`), `ANDROID_KEY_PASSWORD`

Після цього кожен push збирає підписаний `app-release-aab`.

## Кожне оновлення

1. Змініть код у `src/`.
2. Якщо змінилася структура даних:
   - збільште `DATA_VERSION` у `src/app.js`;
   - додайте в `migrate()` крок, що перетворює старі записи.
   Міграція запускається при старті, після відновлення копії та після синхронізації між вкладками.
3. Підніміть версію в `package.json` (`1.0.0` → `1.0.1`). З неї автоматично беруться `versionName` і
   `versionCode` Android та кеш офлайн-версії.
4. `npm test`, потім push. Дочекайтеся зеленої збірки.
5. Завантажте `app-release-aab` у Play Console. Спершу в закритий тест, потім у продакшн з поступовим
   розгортанням (~10% → 100%).
6. iOS: на Mac — `npm run ios`, далі `npx cap open ios`, у Xcode Product → Archive → App Store Connect.
