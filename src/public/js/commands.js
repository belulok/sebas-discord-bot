$(document).ready(function () {
  // Calculate total height of all categories
  var totalHeight = 0;
  $("li[data-category]").each(function () {
    totalHeight += $(this).outerHeight();
  });

  // Set the height of li.commands-info to the total height of all categories
  $("li.commands").height(totalHeight-18);

  // At first, only show the first command
  $("li[data-command]").hide();
  $("li.qr-code-info").hide();
  $("li[data-command]:first").show();
  // Remove 'active' class from all categories
  $("li[data-category]").removeClass("active");
  $("li[data-category]:first").addClass("active");

  // When a category is clicked...
  $("li[data-category]").click(function () {
    // Hide all commands
    $("li[data-command], li.commands-info").hide();

    // Remove 'active' class from all categories
    $("li[data-category]").removeClass("active");

    // Add 'active' class to the clicked category
    $(this).addClass("active");

    // Show the command with the same name as the clicked category
    var categoryName = $(this).attr("data-category");
    $("li[data-command='" + categoryName + "']").show();

    // If "Commands Info" is clicked, show the corresponding data
    if (categoryName === "Commands Info") {
      $("li.commands-info").show();
    }

    // If "QR Code Info" is clicked, show the corresponding data
    if(categoryName === "QR Code Info") {
        $("li.qr-code-info").show();
    }
    else {
        $("li.qr-code-info").hide();
    }
  });
});
