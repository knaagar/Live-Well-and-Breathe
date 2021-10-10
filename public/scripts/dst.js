 function onnavLoad() {
        window.navbar = document.querySelector(".sidebar");
        window.closeBtn = document.querySelector("#btn");
        window.searchBtn = document.querySelector(".bx-search");

        closeBtn.addEventListener("click", () => {
          navbar.classList.toggle("open");
          menuBtnChange();
        });

        searchBtn.addEventListener("click", () => {
          navbar.classList.toggle("open");
          menuBtnChange();
        });
        menuBtnChange = function() {
          if (navbar.classList.contains("open")) {
            closeBtn.classList.replace("bx-menu", "bx-menu-alt-right");
          } else {
            closeBtn.classList.replace("bx-menu-alt-right", "bx-menu");
          }
        }
      }

      let topName = document.getElementById("top-name");
      let h = document.getElementById("h");
      let a = document.getElementById("type");
      
      
var between = function(n, min, max) {
  return n >= min && n <= max
};

function checkSleep(age) {
  let type;
  if(between(age, 1, 2)){
    type = "Toddlers";
  }
  else if(between(age, 3, 5)) {
    type = "Preschoolers";
  }
  else if(between(age, 6, 12)) {
    type = "School-aged children";
  }
  else if(between(age, 13, 17)) {
    type = "Teenagers";
    return type;
  }
  else if(between(age, 18, 25)) {
    type = "Young Adults";
  }
  else if(between(age, 26, 64)) {
    type = "Adults";
  }
  else if(between(age, 65, 100)) {
    type = "Older adults";
  }
  return type;
}


    fetch("/api/user")
      .then(response => response.json())
      .then(data => {
          topName.textContent = data.name;
          h.textContent = data.age;
          
          a.textContent = checkSleep(data.age);
      });

$(function(){
   
  $('#sleepcalc').combodate({
    customClass: 'form-control'
  });  
  
  $('#sleepcalc, .hour, .minute').change( function() {
    updatetime()
  })
  
  
  function updatetime(){
    var interval = moment.duration("01:30:00")
    var secondinterval = moment.duration("03:00:00")
    
    var selectedTime = $('#sleepcalc').combodate('getValue', null)
    
    var time = moment.duration("09:15:00")
    var date = moment(selectedTime)
    date.subtract(time)

    result1 = moment(date).format("h:mm a")
    result2 = moment(date).add(interval).format("h:mm a")
    result3 = moment(date).add(secondinterval).format("h:mm a")

    $('#result1').text(result1).addClass('loaded')
    $('#result2').text(result2).addClass('loaded')
    $('#result3').text(result3).addClass('loaded')
    
    setTimeout(function() {
        $('#result1, #result2, #result3').removeClass('loaded');
    }, 1500)
    
  }              

  updatetime()
  
});



                    
