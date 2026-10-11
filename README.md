# RateBench — калькулятор рейтов и throttle limit для Betaflight

Интерактивный калькулятор для тинивупов 65/75 мм и 5" фристайл/гоночных квадрокоптеров (в т.ч. BetaFPV Air65 II с моторами 0702 25000/30000/36000KV). Меняет чувствительность центра стика, экспоненту и throttle limit, рисует кривую управления и выдаёт готовый дамп для CLI Betaflight. Работает офлайн, формулы воспроизводят `src/main/fc/rc.c` из Betaflight.

- **Веб-версия:** GitHub Pages, папка `docs/`
- **Android:** папка `android/` (WebView-обёртка), готовый APK — в разделе Releases

## Сборка APK
```
cd android && ./sync-assets.sh
gradle assembleRelease   # JDK 17, Android SDK 34
```
Без файла `ratebench.jks` APK подписывается debug-ключом.
