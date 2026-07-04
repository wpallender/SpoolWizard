$(function() {

    function SpoolwizardViewModel(parameters) {
        var self = this;
        
        self.spools = [];

        self.onAfterBinding = function() {
            $("#save-spool").click(function() {
                var brand = $("#brand").val();
                var material = $("#material").val();
                var color = $("#color").val();
                var totalWeight = $("#total_weight").val();
                var remainingWeight = $("#remaining_weight").val();
                
                var spool = {                
                    brand: brand,
                    material: material,
                    color: color,
                    totalWeight: totalWeight,
                    remainingWeight: remainingWeight                
                };
                
                self.spools.push(spool);
                self.updateInventory();
                
                console.log(self.spools);
            });
        };
        
        self.updateInventory = function() {
            console.log("Inventory:");
            console.log(self.spools);
        };
    }

    OCTOPRINT_VIEWMODELS.push({
        construct: SpoolwizardViewModel,
        dependencies: [],
        elements: ["#tab_plugin_spoolwizard"]
    });

});