from __future__ import absolute_import
from flask import jsonify

import octoprint.plugin

class SpoolwizardPlugin(
    octoprint.plugin.SettingsPlugin,
    octoprint.plugin.AssetPlugin,
    octoprint.plugin.TemplatePlugin,
    octoprint.plugin.SimpleApiPlugin
):
    
    def get_template_configs(self):
        return [
            dict(type="tab", custom_bindings=False)
        ]

    def get_settings_defaults(self):
        return {
            "spools": []
        }


    def get_assets(self):
        return {
            "js": ["js/spoolwizard.js"],
            "css": ["css/spoolwizard.css"],
            "less": ["less/spoolwizard.less"]
        }
    
    def on_api_get(self, request):
        return jsonify(
            spools=self._settings.get(["spools"])
        )
    
    def get_api_commands(self):
        return {
            "saveSpools": ["spools"]
        }

    def on_api_command(self, command, data):
        if command == "saveSpools":
            self._settings.set(["spools"], data["spools"])
            self._settings.save()

            return {"success": True}


    def get_update_information(self):
        return {
            "spoolwizard": {
                "displayName": "Spoolwizard Plugin",
                "displayVersion": self._plugin_version,

                "type": "github_release",
                "user": "wpallender",
                "repo": "SpoolWizard",
                "current": self._plugin_version,

                "pip": "https://github.com/wpallender/SpoolWizard/archive/{target_version}.zip",
            }
        }

__plugin_name__ = "SpoolWizard (0.1.0)"

__plugin_pythoncompat__ = ">=3,<4"  # Only Python 3

def __plugin_load__():
    global __plugin_implementation__
    __plugin_implementation__ = SpoolwizardPlugin()

    global __plugin_hooks__
    __plugin_hooks__ = {
        "octoprint.plugin.softwareupdate.check_config": __plugin_implementation__.get_update_information
    }
