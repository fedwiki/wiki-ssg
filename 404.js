(function ({pathname}) {
  const slugHtml = p => /^\/[-\w]+\.html/.test(p)
  const lineup = p => /^\/(?:view|local|[-\w]+(?:\.[-\w]+)+(:\d+)?)\//.test(p)
  const main = document.querySelector('.main')
  if (!slugHtml(pathname) && lineup(pathname)) {
    // add <div id="slug"> tags
    main.innerHTML = ""
    pathname.slice(1).split(/\//).reduce((acc, part, idx) => {
      console.log("404", {idx, branch: idx%2==0, part})
      if (idx%2 == 0) {
        acc.push(pageDiv(part))
      } else {
        let div = acc[acc.length-1]
        div.id = part
      }
      return acc
    }, []).forEach(div => main.appendChild(div))
  }
  let client = script('/client.js')
  client.onload = () => wiki.security(user)
  document.head.appendChild(client)

  function script(url) {
    let script = document.createElement('script')
    script.setAttribute('type', 'text/javascript')
    script.setAttribute('src', url)
    return script
  }
  function pageDiv(site) {
    let div = document.createElement("div")
    div.setAttribute("class", "page")
    div.setAttribute("tabindex", "-1")
    if (site != "view") {
      div.setAttribute("data-site", site)
    }
    return div
  }
})(location)
