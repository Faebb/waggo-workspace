# Proyectos

README de cada repo de Waggo, reunidos en un solo lugar. **Son copias**: se editan en el repo de origen y se actualizan aquí con:

```powershell
.\scripts\sync-readmes.ps1          # copia
.\scripts\sync-readmes.ps1 -Check   # solo verifica (exit 1 si hay copias desactualizadas)
```

| Proyecto | Qué es | README | Repo |
|---|---|---|---|
| waggo-api | Backend .NET 10, Clean Architecture, PostgreSQL + PostGIS, Docker | [README](waggo-api/README.md) | [Faebb/waggo-api](https://github.com/Faebb/waggo-api) |
| waggo-mobile | App Expo (iOS, Android y Web), TypeScript, feature-based | [README](waggo-mobile/README.md) | [Faebb/waggo-mobile](https://github.com/Faebb/waggo-mobile) |

Para agregar un proyecto nuevo, clónalo junto a `waggo-workspace` y súmalo a la lista `$projects` de `scripts/sync-readmes.ps1`.
