import React, { KeyboardEvent, useState } from 'react';
import './App.css';


interface SuggestItemPropsApi {
  text: string,
  relevance: string | undefined,
  suggest_type: string | undefined,
  visible_text: string | undefined,
  description: string | undefined,
  image_url: string | undefined,
  image_background_color: string | undefined,
};
interface SuggestItemProps extends SuggestItemPropsApi {
  selected: boolean | undefined,
  key: any
}

function SuggestItem(props: SuggestItemProps) {
  let classes = `suggest_item ${props.selected === true ? "selected" : ""}`

  let displayText = props.text

  if (props.text.startsWith("http://www.")) {
    displayText = props.text.slice(11)
  } else if (props.text.startsWith("https://www.")) {
    displayText = props.text.slice(12)
  } else if (props.text.startsWith("http://")) {
    displayText = props.text.slice(7)
  } else if (props.text.startsWith("https://")) {
    displayText = props.text.slice(8)
  }


  return (
    <div className={classes} key={props.key}>
      <p>
        {
          props.visible_text
          ?
          <span>{props.visible_text}</span>
          :
          (
            <div>
              <span>{displayText}</span>
              {props.description && <span> | {props.description}</span>}
            </div>
           )}
      </p>
      {/* <p>suggest_type: {props.suggest_type}</p> */}
      {/* <p>visible_text: {props.visible_text}</p> */}
        {/* <p>description: {props.description}</p> */}
      {/* <p>image_url: {props.image_url}</p>
      <p>image_background_color: {props.image_background_color}</p> */}
    </div>
  )
}

function App() {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [items, setItems] = useState<SuggestItemPropsApi[]>([]);

  const handleInput = (newQuery: string) => {

      const params = new URLSearchParams({
        term: newQuery,
        browser: "api",
      });

      fetch("http://127.0.0.1:9099/suggest?"+params.toString())
      .then((response) => response.json())
      .then((data) => {setItems(([{text: newQuery} as SuggestItemPropsApi].concat(data))); setSelectedIndex(0)});

    setQuery(newQuery);
  }

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    console.log(e.key)

    if (e.key === "ArrowUp") {
      let newIndex = (selectedIndex - 1) % items.length
      if (newIndex < 0) newIndex = items.length + newIndex
      setSelectedIndex(newIndex)
      e.preventDefault()
      setQuery(items[newIndex].text)
    }
    if (e.key === "ArrowDown") {
      let newIndex = (selectedIndex + 1) % items.length
      setSelectedIndex(newIndex)
      e.preventDefault()
      setQuery(items[newIndex].text)
    }
    if (e.key === "Enter" && items) {
      const params = new URLSearchParams({
        term: items[selectedIndex].text,
        browser: "api",
      });
      window.open("http://127.0.0.1:9099/search?"+params.toString())
    }
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
