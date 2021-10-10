import $create from "https://cdn.jsdelivr.net/gh/stranothus/create@v1.1.1/module.js";
import DropDown from "https://cdn.jsdelivr.net/gh/stranothus/drop-down@v1.0.0/module.js";

fetch("/api/foods")
.then(response => response.json())
.then(data => {
  let app = document.querySelector("#app");
  
  for(let i = 0; i < data.length; i++) {
    let index = data[i];
    let dropDown = $create(`
    
      <drop-down class = "drop-down" style = "overflow-y: hidden;" event = "click">
        <h2 id = "title" style = "cursor: pointer;">${index.issue}</h2>
        <br>
        <ul id = "content" style = "overflow-y: hidden;"></ul>
      </drop-down> 
      <br><br>
    `);

    app.appendChild(dropDown);

    let content = dropDown.querySelector("#content");

    for(let e = 0; e < index.food.length; e++) {
      let endex = index.food[e];
      let li = $create(`
        <li>
          <h4>${endex.name} -</h4>&nbsp;&nbsp;&nbsp;&nbsp;
        </li>
      `);

      content.appendChild(li);

      for(let j = 0; j < endex.imp.length; j++) {
        let jndex = endex.imp[j];
        let span = $create(`<span> ${jndex}</span>`);
        li.appendChild(span);
      }
    }
  }

  customElements.define("drop-down", DropDown);
});