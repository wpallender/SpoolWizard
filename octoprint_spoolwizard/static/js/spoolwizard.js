$(function () {

    function SpoolwizardViewModel(parameters) {

        var self = this;

        self.spools = [];
        self.activeSpoolId = null;
        self.editingId = null;

        self.onAfterBinding = function () {

            console.log("onAfterBinding called");

            // Load inventory when page opens
            self.loadInventory();

            // Save / Update spool
            $("#save-spool").click(function () {

                var brand = $("#brand").val();
                var material = $("#material").val();
                var color = $("#color").val();
                var totalWeight = $("#total_weight").val();
                var remainingWeight = $("#remaining_weight").val();

                var spool = {
                    id: self.editingId || Date.now(),
                    brand: brand,
                    material: material,
                    color: color,
                    totalWeight: totalWeight,
                    remainingWeight: remainingWeight
                };

                if (self.editingId !== null) {

                    var index = self.spools.findIndex(function (s) {
                        return s.id === self.editingId;
                    });

                    if (index !== -1) {
                        self.spools[index] = spool;
                    }

                    self.editingId = null;
                    $("#save-spool").text("Save Spool");

                } else {

                    self.spools.push(spool);

                }

                self.updateInventory();
                self.updateActiveSpool();

                OctoPrint.simpleApiCommand("spoolwizard", "saveSpools", {
                    spools: self.spools
                }).done(function () {
                    console.log("Inventory saved!");
                });

                // Clear form
                $("#brand").val("");
                $("#material").val("");
                $("#color").val("");
                $("#total_weight").val("");
                $("#remaining_weight").val("");

            });

            // Use spool
            $("#inventory-body").on("click", ".use-spool", function () {

                self.activeSpoolId = Number($(this).data("id"));

                self.updateInventory();
                self.updateActiveSpool();

                OctoPrint.simpleApiCommand("spoolwizard", "saveActiveSpool", {
                    activeSpoolId: self.activeSpoolId
                });

            });

            // Edit spool
            $("#inventory-body").on("click", ".edit-spool", function () {

                var id = Number($(this).data("id"));

                var spool = self.spools.find(function (s) {
                    return s.id === id;
                });

                if (!spool) return;

                $("#brand").val(spool.brand);
                $("#material").val(spool.material);
                $("#color").val(spool.color);
                $("#total_weight").val(spool.totalWeight);
                $("#remaining_weight").val(spool.remainingWeight);

                self.editingId = id;

                $("#save-spool").text("Update Spool");

            });

            // Delete spool
            $("#inventory-body").on("click", ".delete-spool", function () {

                var id = Number($(this).data("id"));

                if (!confirm("Are you sure you want to delete this spool?")) {
                    return;
                }

                self.spools = self.spools.filter(function (spool) {
                    return spool.id !== id;
                });

                if (self.activeSpoolId === id) {
                    self.activeSpoolId = null;
                    self.updateActiveSpool();

                    OctoPrint.simpleApiCommand("spoolwizard", "saveActiveSpool", {
                        activeSpoolId: null
                    });
                }

                self.updateInventory();

                OctoPrint.simpleApiCommand("spoolwizard", "saveSpools", {
                    spools: self.spools
                }).done(function () {
                    console.log("Inventory saved after delete!");
                });

            });

        };

        self.updateInventory = function () {

            var table = $("#inventory-body");
            table.empty();

            self.spools.forEach(function (spool) {

                var useButton;

                if (spool.id === self.activeSpoolId) {
                    useButton = "<button class='btn btn-success' disabled>Active</button>";
                } else {
                    useButton = "<button class='use-spool btn btn-success' data-id='" + spool.id + "'>Use</button>";
                }

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
                        "<td>" +
                            useButton + " " +
                            "<button class='edit-spool btn btn-warning' data-id='" + spool.id + "'>Edit</button> " +
                            "<button class='delete-spool btn btn-danger' data-id='" + spool.id + "'>Delete</button>" +
                        "</td>" +
                    "</tr>"
                );

            });

        };

        self.loadInventory = function () {

            console.log("Loading inventory...");

            OctoPrint.simpleApiGet("spoolwizard")
                .done(function (response) {

                    console.log("Loaded:", response);

                    self.spools = response.spools || [];
                    self.activeSpoolId = response.activeSpoolId;

                    self.updateInventory();
                    self.updateActiveSpool();

                })
                .fail(function (error) {

                    console.log("Failed to load inventory:", error);

                });

        };

        self.updateActiveSpool = function () {

            var spool = self.spools.find(function (s) {
                return s.id === self.activeSpoolId;
            });

            if (!spool) {
                $("#active-name").text("No Active Spool");
                $("#active-weight").text("Select a spool below.");
                return;
            }

            $("#active-name").text(
                spool.brand + " " +
                spool.material + " " +
                spool.color
            );

            $("#active-weight").text(
                spool.remainingWeight + " g Remaining"
            );

        };

    }

    OCTOPRINT_VIEWMODELS.push({
        construct: SpoolwizardViewModel,
        dependencies: [],
        elements: ["#tab_plugin_spoolwizard"]
    });

});