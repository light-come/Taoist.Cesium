window.onload = () => {
    init();
}
function init() {
    const array = [
            {name:"EdgeStage",url:'./example/EdgeStage.html'},
            {name:"UnrealBloomStage",url:'./example/UnrealBloomStage.html'}
    ]
    array.forEach(element => {
        
        let dom =  document.createElement("a")
        dom.setAttribute("href", element.url);
        dom.innerHTML = (element.name);
        let p = document.createElement("p")
        p.appendChild(dom)
        document.body.appendChild( p );
    });
}