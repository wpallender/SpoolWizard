$(function () {
    function SpoolwizardViewModel(parameters) {
        var self = this;

        self.spools = [];
        self.activeSpoolId = null;
        self.editingId = null;

        self.onAfterBinding = function () {
            console.log("onAfterBinding called");

            // Load inventory
            self.loadInventory();
            
            //View History
            $("#inventory-body").on("click", ".view-history", function (e) {
                e.preventDefault();

                var id = Number($(this).data("id"));
                self.showHistory(id);
            });
            
            //Adjust Spool Weight
            $("#adjust").click(function () {
                if (self.activeSpoolId === null) {
                    alert("Select an active spool first.");
                    return;
                }

                var amount = Number($("#adjust-weight").val());
                var type = $("#adjust-type").val();

                if (isNaN(amount) || amount <= 0) {
                    alert("Enter a valid weight.");
                    return;
                }

                var spool = self.spools.find(function (s) {
                    return s.id === self.activeSpoolId;
                });

                if (!spool) {
                    return;
                }

                if (type === "subtract") {
                    if (amount > spool.remainingWeight) {
                        alert("Not enough filament remaining.");
                        return;
                    }

                    spool.remainingWeight -= amount;
                } else {
                    if (spool.remainingWeight + amount > spool.totalWeight) {
                        alert("Cannot exceed the spool's total weight.");
                        return;
                    }

                    spool.remainingWeight += amount;
                }

                spool.history = spool.history || [];

                spool.history.push({
                    timestamp: Date.now(),
                    date: new Date().toISOString(),
                    type: type,
                    amount: amount,
                    remaining: spool.remainingWeight
                });

                self.updateInventory();
                self.updateActiveSpool();

                $("#adjust").prop("disabled", true);

                OctoPrint.simpleApiCommand("spoolwizard", "saveSpools", {
                    spools: self.spools
                })
                .done(function () {
                    console.log("Weight updated.");
                })
                .fail(function () {
                    alert("Unable to save spool changes.");
                })
                .always(function () {
                    $("#adjust").prop("disabled", false);
                });

                $("#adjust-weight").val("");
                $("#adjust-type").val("subtract");
            });

            // Save / Update spool
            $("#save-spool").click(function () {

                var brand = $("#brand").val().trim();
                var material = $("#material").val().trim();
                var color = $("#color").val().trim();
                var totalWeight = Number($("#total_weight").val());
                var remainingWeight = Number($("#remaining_weight").val());

                if (!brand) {
                    alert("Please enter a brand.");
                    $("#brand").focus();
                    return;
                }

                if (!material) {
                    alert("Please enter a material.");
                    $("#material").focus();
                    return;
                }

                if (!color) {
                    alert("Please enter a color.");
                    $("#color").focus();
                    return;
                }

                if (isNaN(totalWeight) || totalWeight <= 0) {
                    alert("Total weight must be greater than 0 grams.");
                    $("#total_weight").focus();
                    return;
                }

                if (isNaN(remainingWeight) || remainingWeight < 0) {
                    alert("Remaining weight cannot be negative.");
                    $("#remaining_weight").focus();
                    return;
                }

                if (remainingWeight > totalWeight) {
                    alert("Remaining weight cannot be greater than the total weight.");
                    $("#remaining_weight").focus();
                    return;
                }

                var existingSpool = self.spools.find(function (s) {
                    return s.id === self.editingId;
                });

                var spool = {
                    id: self.editingId || Date.now(),
                    brand: brand,
                    material: material,
                    color: color,
                    totalWeight: totalWeight,
                    remainingWeight: remainingWeight,
                    history: existingSpool && existingSpool.history ? existingSpool.history : []
                };
                
                if (self.editingId !== null) {
                    var index = self.spools.findIndex(function (s) {
                        return s.id === self.editingId;
                    });

                    if (index !== -1) {
                        self.spools[index] = spool;
                    }

                    self.editingId = null;

                    $("#save-spool")
                        .text("Save Spool")
                        .removeClass("btn-warning")
                        .addClass("btn-primary");
                } else {
                    self.spools.push(spool);
                }

                self.updateInventory();
                self.updateActiveSpool();

                OctoPrint.simpleApiCommand("spoolwizard", "saveSpools", {
                    spools: self.spools
                })
                .done(function () {
                    console.log("Inventory saved!");
                })
                .fail(function (xhr) {
                    console.error("Failed to save inventory:", xhr);
                    alert("Unable to save the inventory. Please try again.");
                });

                // Clear form
                $("#brand").val("");
                $("#material").val("");
                $("#color").val("");
                $("#total_weight").val("");
                $("#remaining_weight").val("");
            });

            // Set active spool
            $("#inventory-body").on("click", ".use-spool", function () {
                self.activeSpoolId = Number($(this).data("id"));

                self.updateInventory();
                self.updateActiveSpool();

                OctoPrint.simpleApiCommand("spoolwizard", "saveActiveSpool", {
                    activeSpoolId: self.activeSpoolId
                })
                .done(function () {
                    console.log("Active spool saved.");
                })
                .fail(function () {
                    alert("Unable to save the active spool.");
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

                $("#save-spool")
                    .text("Update Spool")
                    .removeClass("btn-primary")
                    .addClass("btn-warning");
            });

            // Delete spool
            $("#inventory-body").on("click", ".delete-spool", function () {
                var id = Number($(this).data("id"));

                if (!confirm("Delete this spool?")) {
                    return;
                }

                self.spools = self.spools.filter(function (spool) {
                    return spool.id !== id;
                });

                if (self.activeSpoolId === id) {
                    self.activeSpoolId = null;
                    
                    $("#adjust-weight").val("");
                    $("#adjust-type").val("subtract");

                    OctoPrint.simpleApiCommand("spoolwizard", "saveActiveSpool", {
                        activeSpoolId: null
                    });

                    self.updateActiveSpool();
                }

                self.updateInventory();
                
                $("#save-spool").prop("disabled", true);

                OctoPrint.simpleApiCommand("spoolwizard", "saveSpools", {
                    spools: self.spools
                })
                .done(function () {
                    console.log("Inventory saved after delete!");
                })
                .fail(function () {
                    alert("Unable to delete spool.");
                })
                .always(function () {
                    $("#save-spool").prop("disabled", false);
                });
            });
        };

        self.updateInventory = function () {
            var table = $("#inventory-body");
            table.empty();

            if (self.spools.length === 0) {
                table.html(
                    "<tr><td colspan='3' style='text-align:center;color:#888;'>No spools in inventory.</td></tr>"
                );
                return;
            }

            // Active spool first, then alphabetical
            var sortedSpools = self.spools.slice().sort(function (a, b) {
                if (a.id === self.activeSpoolId) return -1;
                if (b.id === self.activeSpoolId) return 1;
                return a.brand.localeCompare(b.brand);
            });

            sortedSpools.forEach(function (spool) {

                var useButton;

                if (spool.id === self.activeSpoolId) {
                    useButton = "<button class='btn btn-success' disabled>Active</button>";
                } else {
                    useButton = "<button class='use-spool btn btn-success' data-id='" + spool.id + "'>Use</button>";
                }

                var percent = Math.round(
                    (spool.remainingWeight / spool.totalWeight) * 100
                );

                table.append(
                    "<tr>" +
                        "<td>" +
                            "<a href='#' class='view-history' data-id='" + spool.id + "'>" +
                                "<strong>" + spool.brand + "</strong><br>" +
                                "<small>" + spool.material + " • " + spool.color + "</small>" +
                            "</a>" +
                        "</td>" +

                        "<td>" +
                            spool.remainingWeight +
                            " g / " +
                            spool.totalWeight +
                            " g<br>" +
                            "<small>" + percent + "% remaining</small>" +
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
                    self.spools = response.spools || [];
                    self.activeSpoolId = response.activeSpoolId || null;

                    self.updateInventory();
                    self.updateActiveSpool();
                })
                .fail(function (xhr) {
                    console.error("Load failed:", xhr);

                    $("#inventory-body").html(
                        "<tr><td colspan='3' style='text-align:center;color:#d9534f;'>" +
                        "Failed to load inventory." +
                        "</td></tr>"
                    );
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

            var percent = Math.round(
                (spool.remainingWeight / spool.totalWeight) * 100
            );

            $("#active-name").text(
                spool.brand + " " +
                spool.material + " " +
                spool.color
            );

            $("#active-weight").text(
                spool.remainingWeight +
                " g / " +
                spool.totalWeight +
                " g (" +
                percent +
                "% remaining)"
            );
        };
        
        self.showHistory = function (id) {

            var spool = self.spools.find(function (s) {
                return s.id === id;
            });

            if (!spool) {
                return;
            }
            
            $("#history-title").text(
                "History — " +
                spool.brand + " " +
                spool.material + " " +
                spool.color
            );

            var html = "";

            if (!spool.history || spool.history.length === 0) {

                html = "<p>No adjustments have been recorded.</p>";

            } else {

                html = "<table class='table table-striped'>";
                html += "<thead>";
                html += "<tr>";
                html += "<th>Date</th>";
                html += "<th>Change</th>";
                html += "<th>Remaining</th>";
                html += "</tr>";
                html += "</thead><tbody>";

                spool.history.slice().reverse().forEach(function (entry) {

                    var color = entry.type === "add"
                        ? "green"
                        : "red";

                    var sign = entry.type === "add"
                        ? "+"
                        : "-";

                    html +=
                        "<tr>" +
                        "<td>" + new Date(entry.date).toLocaleString() + "</td>" +
                        "<td style='color:" + color + ";font-weight:bold;'>" +
                        sign + entry.amount + " g" +
                        "</td>" +
                        "<td>" + entry.remaining + " g</td>" +
                        "</tr>";

                });

                html += "</tbody></table>";
            }

            $("#history-content").html(html);

            $("#history-modal").modal("show");
        };
    }

    OCTOPRINT_VIEWMODELS.push({
        construct: SpoolwizardViewModel,
        dependencies: [],
        elements: ["#tab_plugin_spoolwizard"]
    });
});