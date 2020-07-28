$(document).ready(() => {
  const hub = $('#addedIngredientHub');
  const contentCard = $('#contentCard');

  $.get('/get-keywords', (data) => {
    if (data.length == 0) {
      hub.append(`
        <h5 class="my-auto">0 ingredienser</h5>
      `);
    }
    else {
      data.forEach((item, i) => {
        hub.append(`
          <div class="card my-3 py-2 px-3">
            <div class="row">
              <div class="col-10 my-auto">
                <h5 class="my-auto">${item.keyword}</h5>
              </div>
              <div class="col-2 my-auto">
                <button class="btn btn-danger" data-id="${item.keyword}">
                  <i class="far fa-times-circle"></i>
                </button>
              </div>
            </div>
          </div>
        `);

        $(`button[data-id="${item.keyword}"]`).on('click', () => {
          $.ajax({
            url: `/delete-keyword/${item.keyword}`,
            type: 'DELETE',
            success: (d) => {
              $(`button[data-id="${item.keyword}"]`).parent().parent().parent().remove();

              if (hub.children().length == 0) {
                hub.append(`
                  <h5 class="my-auto">0 ingredienser</h5>
                `);
              }
            }
          });
        });
      });
    }
  });

  $('#addIngredientBtn').on('click', () => {
    const input = $('#addIngredientInput');
    let v = input.val();
    let vStr = '';

    v = v.split('');

    v = v.forEach((item, i) => {
      if (i == 0) {
        vStr += item.toUpperCase();
      }
      else {
        vStr += item.toLowerCase();
      }
    });

    $.get('/get-keywords', (data) => {
      const checkKeyword = data.filter(item => item.keyword == vStr);

      if (vStr != '' && checkKeyword.length == 0) {
        $.ajax({
          url: '/add-keyword',
          type: 'POST',
          data: {keyword: vStr},
          success: (d) => {
            input.val('');

            console.log(hub.children()[0]);
            if (hub.children()[0].innerText == '0 ingredienser') {
              hub.empty();
            }

            hub.append(`
              <div class="card my-3 py-2 px-3">
                <div class="row">
                  <div class="col-10 my-auto">
                    <h5 class="my-auto">${vStr}</h5>
                  </div>
                  <div class="col-2 my-auto">
                    <button class="btn btn-danger" data-id="${vStr}">
                      <i class="far fa-times-circle"></i>
                    </button>
                  </div>
                </div>
              </div>
            `);

            $(`button[data-id="${vStr}"]`).on('click', () => {
              $.ajax({
                url: `/delete-keyword/${vStr}`,
                type: 'DELETE',
                success: (d) => {
                  $(`button[data-id="${vStr}"]`).parent().parent().parent().remove();

                  if (hub.children().length == 0) {
                    hub.append(`
                      <h5 class="my-auto">0 ingredienser</h5>
                    `);
                  }
                }
              });
            });
          }
        });
      }
    });
  });

  $('#clearSearchListBtn').on('click', () => {
    $.ajax({
      url: '/delete-all-keywords-and-filters',
      type: 'DELETE',
      success: (data) => {
        let checkboxes = $('input[type="checkbox"]');

        checkboxes.each((i, item) => {
          item.checked = false;
        });

        hub.empty();

        hub.append(`
          <h5 class="my-auto">0 ingredienser</h5>
        `);

        contentCard.empty();
      }
    });
  });

  $('#searchBtn').on('click', () => {
    $('#searchBtn').prop('disabled', true);

    function getContent() {
      contentCard.empty();
      contentCard.append(`
        <div class="card mx-auto my-4 py-4 px-3" style="width:30%;">
          <div class="row">
            <div class="col-12 my-auto">
              <h3 class="my-auto text-center">Laddar...</h3>
            </div>
          </div>
        </div>
      `);

      $.get('/get-recipes', (data) => {
        contentCard.empty();

        if (data[0].error) {
          $.ajax({
            url: '/delete-all-keywords-and-filters',
            type: 'DELETE',
            success: (data) => {
              contentCard.append(`
                <div class="card mx-auto my-4 py-4 px-3" style="width:30%;">
                  <div class="row">
                    <div class="col-12 my-auto">
                      <h4 class="text-center">INGEN TRÄFF!</h4>
                    </div>
                  </div>
                </div>
              `);

              let checkboxes = $('input[type="checkbox"]');

              checkboxes.each((i, item) => {
                item.checked = false;
              });

              hub.empty();

              hub.append(`
                <h5 class="my-auto">0 ingredienser</h5>
              `);

              $('#searchBtn').prop('disabled', false);
            }
          });
        }
        else {
          for (let i = 0; i < data.length; i++) {
            let cur = data[i];

            contentCard.append(`
              <div class="card my-5 py-2 px-3">
                <button type="button" class="btn" id="ingredientsBtn${i}" data-toggle="collapse" data-target="#ingredientsCollapse${i}" aria-expanded="false" aria-controls="ingredientsCollapse${i}">
                  <div class="row">
                    <div class="col-4 my-auto py-2">
                      <h5 class="text-center">Titel:</h5>
                    </div>
                    <div class="col-4 my-auto py-2">
                      <h5 class="text-center">Av:</h5>
                    </div>
                    <div class="col-4 my-auto py-2">
                      <h5 class="text-center">Tid:</h5>
                    </div>
                    <div class="col-4 my-auto py-2">
                      <h3 class="text-center">${cur.Title}</h3>
                    </div>
                    <div class="col-4 my-auto py-2">
                      <h3 class="text-center">${cur.Author}</h3>
                    </div>
                    <div class="col-4 my-auto py-2">
                      <h3 class="text-center">${cur.Time}</h3>
                    </div>
                    <div class="col-12">
                      <hr>
                    </div>
                  </div>
                </button>
                <div class="collapse" id="ingredientsCollapse${i}">
                  <div class="row">
                    <div class="col-6 py-2">
                      <h4 class="my-auto py-2">Ingredienser:</h4>
                      <ul class="list-group" id="ingredients${i}"></ul>
                    </div>
                    <div class="col-6 py-2">
                      <h4 class="my-auto py-2">Process:</h4>
                      <ul class="list-group" id="instructions${i}"></ul>
                    </div>
                  </div>
                </div>
              </div>
            `);

            for (const ingredient of cur.Ingredients) {
              $(`#ingredients${i}`).append(`
                <li class="list-group-item">
                  <h6>${ingredient}</h6>
                </li>
              `);
            }

            for (const instruction of cur.Instructions) {
              $(`#instructions${i}`).append(`
                <li class="list-group-item">
                  <h6>${instruction}</h6>
                </li>
              `);
            }
          }

          $.ajax({
            url: '/delete-all-keywords-and-filters',
            type: 'DELETE',
            success: (data) => {
              let checkboxes = $('input[type="checkbox"]');

              checkboxes.each((i, item) => {
                item.checked = false;
              });

              hub.empty();

              hub.append(`
                <h5 class="my-auto">0 ingredienser</h5>
              `);

              $('#searchBtn').prop('disabled', false);
            }
          });
        }
      });
    }

    let checkboxes = $('input[type="checkbox"]');
    let checkCount = 0;
    let counter = 0;
    let uncheckCount = 0;

    checkboxes.each((i, item) => {
      if (item.checked) {
        checkCount++;
      }
    });

    checkboxes.each((i, item) => {
      if (item.checked) {
        const id = item.getAttribute('id').split('_')[1];

        $.ajax({
          url: `/add-filters`,
          type: 'POST',
          data: {filterCode: id},
          success: (filterData) => {
            counter++;

            if (checkCount == counter) {
              getContent();
            }
          }
        });
      }
      else {
        uncheckCount++;

        if (uncheckCount == checkboxes.length) {
          getContent();
        }
      }
    });
  });

  $('#addIngredientInput').focus();
});
