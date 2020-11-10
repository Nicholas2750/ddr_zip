var $result = $("#result");
$("#file").on("change", function(evt) {
  // remove content
  $result.html("");
  // be sure to show the results
  $("#result_block").removeClass("hidden").addClass("show");

  // Closure to capture the file information.
  function displayZip(f) {
    var $title = $("<h4>", {
      text : f.name
    });
    var $fileContent = $("<ul>");
    $result.append($title);
    $result.append($fileContent);

    var dateBefore = new Date();
    JSZip.loadAsync(f)                                   // 1) read the Blob
      .then(function(zip) {
        var dateAfter = new Date();
        $title.append($("<span>", {
          "class": "small",
          text:" (loaded in " + (dateAfter - dateBefore) + "ms)"
        }));

        zip.forEach(function (relativePath, zipEntry) {  // 2) print entries
          $fileContent.append($("<li>", {
            text : zipEntry.name
          }));
        });
      }, function (e) {
        $result.append($("<div>", {
          "class" : "alert alert-danger",
          text : "Error reading " + f.name + ": " + e.message
        }));
      });
  }

  function modifyZip(f) {
    JSZip.loadAsync(f).then(function(zip) {
      let promises = [];

      zip.forEach(function (relativePath, zipEntry) {
        if (relativePath.endsWith('.sm') || relativePath.endsWith('.sdd')) {
          promises.push(
            zipEntry.async('text').then((content) => {
              content = content.replace(/OFFSET:[\s\S]*?;/, `OFFSET:${$("#offset").val()};`);
              zip.file(relativePath, content);
            })
          );
        }
      });

      Promise.all(promises).then(function (data) {
        zip.generateAsync({type:"blob"}).then(function (blob) {
          saveAs(blob, "modified.zip");
        }, function (err) {
          jQuery("#blob").text(err);
        });
      });
    })
  }

  var file = evt.target.files[0];
  displayZip(file);
  modifyZip(file);
});
