
init();
function init() {
        const array = [
                {name:"CreateEdgeStage",url:'createEdgeStage.html'}
        ]
        array.forEach(element => {
                let dom = document.createElement("a");
                dom.setAttribute("href", element.url);
                dom.innerHTML = (element.name);
                document.body.appendChild( dom );
        });
}