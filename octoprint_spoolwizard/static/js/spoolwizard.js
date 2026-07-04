$(function() {

    function SpoolwizardViewModel(parameters) {
        var self = this;

        self.onAfterBinding = function() {
            $("#save-spool").click(function() {
                var brand = $("#brand").val();
                var material = $("#material").val();
                var color = $("#color").val();
                var totalWeight = $("#total_weight").val();
                var remainingWeight = $("#remaining_weight").val();
                
                alert(
                    "Brand: " + brand +
                    "\nMaterial: " + material +
                    "\nColor: " + color +
                    "\n Total Weight: " + totalWeight +
                    "g\nRemaining Weight: " + remainingWeight + "g"
                )
            });
        };
    }

    OCTOPRINT_VIEWMODELS.push({
        construct: SpoolwizardViewModel,
        dependencies: [],
        elements: ["#tab_plugin_spoolwizard"]
    });

});