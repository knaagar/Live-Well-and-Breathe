(async function() {
  let goal = await fetch("/api/user")
  .then(response => response.json())
  .then(data => {
    let url = window.location.href;
    let title = url.split("/").reverse()[0];
    
    for(let i = 0; i < data.goals.length; i++) {
      if(title === encodeURIComponent(data.goals[i].title.replace(/\s/g, "-")).toLowerCase()) {
        data.goals[i].createdLocale = new Date(data.goals[i].created).toLocaleDateString();
        data.goals[i].completeByLocale = new Date(data.goals[i].completeBy).toLocaleDateString();

        return data.goals[i];
      }
    }
  });

  var app = new Vue({
    el: '#app',
    data: {
      goal: goal,
    }
  });
})();