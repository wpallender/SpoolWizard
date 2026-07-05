# SpoolWizard

Smart filament inventory management for OctoPrint.

SpoolWizard helps you organize your filament inventory, manage your active spool, and provides the foundation for automatic filament tracking, print history, usage statistics, and other advanced spool management features.

> **Status:** Pre-release (v0.x) — APIs, features, and the user interface may change before the stable v1.0.0 release.

---

## Features

### Current

- Filament inventory management
- Add, edit, and delete spools
- Active spool selection
- Input validation
- Persistent inventory storage
- User-friendly interface integrated with OctoPrint

### Planned

- Automatic filament usage tracking
- Print history
- Statistics dashboard
- Cost tracking
- Inventory search and filtering
- QR code support
- RFID/NFC support
- AI-assisted print monitoring

For the complete development roadmap, see the [Roadmap](docs/roadmap.md).

---

## Installation

### Plugin Manager (Recommended)

Install SpoolWizard through OctoPrint's built-in Plugin Manager once it becomes available.

### Manual Installation

Install directly from GitHub using:

```text
https://github.com/wpallender/SpoolWizard/archive/main.zip
```

For detailed installation instructions, see the [Installation Guide](docs/installation.md).

---

## Getting Started

1. Open the **SpoolWizard** tab in OctoPrint.
2. Add your filament spools.
3. Select an active spool.
4. Manage and organize your inventory.

For more information, see the [User Guide](docs/usage.md).

---

## Documentation

- [Installation Guide](docs/installation.md)
- [User Guide](docs/usage.md)
- [Roadmap](docs/roadmap.md)
- [Changelog](CHANGELOG.md)
- [Frequently Asked Questions](docs/faq.md)

---

## Known Limitations

SpoolWizard is currently in active pre-release development. While the core inventory features are functional, several planned capabilities are not yet available.

Current limitations include:

- Filament usage is **not automatically tracked** after prints.
- Remaining spool weight must be updated manually.
- Print history is not yet recorded.
- Statistics and usage charts are not available.
- Inventory import/export has not been implemented.
- Multi-printer support is not yet available.
- QR code, RFID, and NFC integration are planned for future releases.
- Some features and the user interface may change before the stable v1.0.0 release.

---

## Support

If you encounter a bug or have a feature request, please open an Issue on GitHub.

SpoolWizard is currently developed and maintained by a single developer, so code contributions are not being accepted at this time.

---

## License

SpoolWizard is licensed under the MIT License.

See the [LICENSE](LICENSE) file for details.