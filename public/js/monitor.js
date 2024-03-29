$(function() {

    // Whenever a modal is shown, use data from related button to set modal title
    $("#detailsModal").on("shown.bs.modal", function (event) { 
        const button = event.relatedTarget;
        const deviceName = button.getAttribute('data-bs-devicename');

        $(".modal-title").text(deviceName);
    }); 

    // Filters cards on the page by name. Filtered by input in #filterDevices
    $("#filterDevices").keyup(function() {
        $(".card").each(function(index, obj) {
            let cardTitle = $(this).find("h4");
            if ((cardTitle.text().toUpperCase().includes($("#filterDevices").val().toUpperCase()))) {
                $(obj).parent().removeClass("d-none");
            }
            else {
                $(obj).parent().addClass("d-none");
            }
        });
    });

    // Returns a random time from 5-10 seconds
    function getRandTime() {
        let rand = Math.random() * (10000 - 5000) + 5000;
        return rand;
    }

    // Toggles colors of status element (passed by obj) and changes image to offline image if needed
    function toggleStatus(obj) {
        if (obj.attr("class").includes("status-green")) {
            obj.removeClass("status-green");
            obj.addClass("status-red");
        }
        else {
            obj.removeClass("status-red");
            obj.addClass("status-green");
        }

        // deviceOffline = true if either "Network" or "Power" is red within the card
        let deviceOffline = false;
        obj.closest(".container").find("span").each(function(index, child) {
            if ($(child).text() === "Power" || $(child).text() === "Network") {
                if ($(child).prev(".status-red").length === 1) {
                    deviceOffline = true;
                }
            }
        });

        const cardImg = obj.closest(".card").find("img");
        if (deviceOffline) cardImg.attr("src", "images/pcoffline.png");
        else cardImg.attr("src", "images/pc.png");
    }

    // Randomly decides whether or not to toggle color of each .status element
    function updateStatus() {
        $(".status").each(function (i, obj) {
            // 1 in 20 chance of changing status
            let rand = Math.floor(Math.random() * (20 - 1) + 1);
            if (rand == 1) {
                toggleStatus($(obj));
            }
        });

        clearInterval(anim);
        anim = setInterval(updateStatus, getRandTime());
    };

    // Add num cards to monitorRow. Card title and data-bs-devicename for each is based on nameArr.
    function populateRows(num, nameArr) {
        let nameIndex = 0;
        for (let i = 0; i < num; i++)
        {
            if (nameIndex >= nameArr.length) nameIndex = 0;

            $("#monitorRow").append(`
                    <div class="col">
                        <div class="card border-secondary h-100">
                            <div class="row g-0">
                                <div class="col-md-4 p-3 d-flex flex-column text-nowrap">
                                    <h4 class="text-center card-title">
                                        ${nameArr[nameIndex]}
                                        </h5>
                                    <img src="images/pc.png" class="img-fluid">
                                    <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#detailsModal" data-bs-devicename="${nameArr[nameIndex]}">
                                        View Details
                                    </button>
                                </div>
                                <div class="col-md-8 d-flex align-items-center">
                                    <div class="card-body">
                                        <div class="align-middle card-text">
                                            <div class="status-div">
                                                <div class="container">
                                                    <div class="row">
                                                        <div class="col">
                                                            <span class="status status-green">●</span> 
                                                            <span>Power</span>
                                                        </div>
                                                        <div class="col">
                                                            <span class="status status-green">●</span> 
                                                            <span>Network</span>
                                                        </div>
                                                    </div>
                                                    <div class="row">
                                                        <div class="col">
                                                            <span class="status status-green">●</span> 
                                                            <span>Display</span>
                                                        </div>
                                                        <div class="col">
                                                            <span class="status status-green">●</span> 
                                                            <span>Mouse</span>
                                                        </div>
                                                    </div>
                                                    <div class="row">
                                                        <div class="col">
                                                            <span class="status status-green">●</span> 
                                                            <span>Keyboard</span>
                                                        </div>
                                                        <div class="col">
                                                            <span class="status status-green">●</span> 
                                                            <span>Speakers</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
            `);

            nameIndex++;
        }
    }

    // Randomly executes based on getRandTime(); 
    let anim = setInterval(updateStatus, getRandTime());

    let pcNames = ["OFFICE-01", "OFFICE-02", "WORKSTATION-01", "JIM", "KIOSK-01", "REGISTER-01", "REGISTER-02", "REGISTER-03"];
    populateRows(8, pcNames);

});
