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
                
                $("#brand").val("");
                $("#material").val("");
                $("#color").val("");
                $("#total_weight").val("");
                $("#remaining_weight").val("");
                
                console.log(self.spools);
            });
        };
        
        self.updateInventory = function() {

            var table = $("#inventory-body");

            table.empty();

            self.spools.forEach(function(spool) {

                table.append(
                    "<tr>" +
                        "<td>" +
                        spool.brand + " " +
                        spool.material + " " +
                        spool.color +
                        "</td>" +
                        "<td>" +
                        spool.remainingWeight + " g" +
                        "</td>" +
                    "</tr>"
                );

            });

        };
    }

    OCTOPRINT_VIEWMODELS.push({
        construct: SpoolwizardViewModel,
        dependencies: [],
        elements: ["#tab_plugin_spoolwizard"]
    });

});