import React, { KeyboardEvent, useEffect, useState } from 'react';
import './App.css';


interface SuggestItemPropsApi {
  text: string,
  url: string | undefined
  description: string | undefined
};
interface SuggestItemProps extends SuggestItemPropsApi {
  selected: boolean | undefined,
  key: any
}

function SuggestItem(props: SuggestItemProps) {
  let classes = `suggest_item ${props.selected === true ? "selected" : ""}`

  let isLink = !!props.url
  let icon = (isLink ? "🔗" : "📋")

  return (
    <div className={classes} key={props.key}>
      <p>
        <span><pre>{icon} text:</pre> {props.text}</span>
        <span><pre>url:</pre> {props.url}</span>
        <span><pre>description:</pre> {props.description}</span>
      </p>
    </div>
  )
}

function App() {
  const [query, setQuery] = useState("");  // TODO prefill with cb
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [items, setItems] = useState<SuggestItemPropsApi[]>([]);

  useEffect(() => {
    navigator.clipboard.readText().then((value) => {setQuery(value)}).catch(() => {
      const urlParams = new URLSearchParams(window.location.search);
      setQuery(urlParams.get('clipboard')!)
    })
  }, [])

  const handleInput = (newQuery: string) => {

      const params = new URLSearchParams({
        query: newQuery,
      });

      fetch("api?"+params.toString())
      .then((response) => response.json())
      .then((data) => {
        let newItems = [{text: newQuery} as SuggestItemPropsApi].concat(data);
        if (!data.length) newItems = []
        setItems(newItems);
         setSelectedIndex(0)
      });

    setQuery(newQuery);
  }

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    // console.log(e.key, e.shiftKey, (e.key === "Tab" && e.shiftKey))

    if (e.key === "ArrowUp" || (e.key === "Tab" && e.shiftKey)) {
      let newIndex = (selectedIndex - 1) % items.length
      if (newIndex < 0) newIndex = items.length + newIndex
      setSelectedIndex(newIndex)
      e.preventDefault()
      items[newIndex] && setQuery(items[newIndex].text)
    }
    else if (e.key === "ArrowDown" || e.key === "Tab") {
      let newIndex = (selectedIndex + 1) % items.length
      setSelectedIndex(newIndex)
      e.preventDefault()
      items[newIndex] && setQuery(items[newIndex].text)
    }
    else if (e.key === "Enter" && items) {
      // TODO process opening url or copying entity
    }
    // TODO process copying item
    // TODO mb add entropy (random)
    // TODO че должен делать escape?
  }

  return (
    <div className="App">
      <input type='text' value={query} autoFocus onKeyDownCapture={e => handleKey(e)} onChange={e => {handleInput(e.target.value)}}/>
      {
        items.map((value, index) => {
          return SuggestItem({...value, selected: index === selectedIndex, key: index})
        })
      }
    </div>
  );
}

export default App;
