import React, { KeyboardEvent, useEffect, useState } from 'react';
import './App.css';


interface SuggestItemPropsApi {
  text: string | undefined,
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
        <span>{icon} {
          isLink
            ?
            <a href={props.url}>{props.description}</a>
            :
            props.text
        }</span>
        <span> {props.url}</span>
        <span> {props.description}</span>
      </p>
    </div>
  )
}

const HOST = process.env.NODE_ENV === "production" ? "" : "http://127.0.0.1:9090"

async function calcInitialQuery() {
  return navigator.clipboard.readText()
    .then((value) => {
      return value
    })
    .catch(() => {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get('clipboard')!
    }
  ).then((value) => {
    if (!!value) {
      return value
    } else {
      return ""
    }
  })

};
// const initialQuery = await calcInitialQuery();
// console.log('initial query', initialQuery)

function App() {
  const [query, setQuery] = useState("");  // TODO prefill with cb
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [items, setItems] = useState<SuggestItemPropsApi[]>([]);

  const setQueryFromItem = (item: SuggestItemPropsApi) => {
    if (!!item.text) {
      setQuery(item.text)
    } else {
      setQuery(item.url!)
    }
  }

  useEffect(() => {
    calcInitialQuery().then((initialQuery) => {
      handleInput(initialQuery)
    })
  }, [])

  const handleInput = (newQuery: string) => {

    const params = new URLSearchParams({
      query: newQuery,
    });

    fetch(HOST + "/api?" + params.toString())
      .then((response) => response.json())
      .then((data) => {
        let newItems = [{ text: newQuery } as SuggestItemPropsApi].concat(data);
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
      items[newIndex] && setQueryFromItem(items[newIndex])
    }
    else if (e.key === "ArrowDown" || e.key === "Tab") {
      let newIndex = (selectedIndex + 1) % items.length
      setSelectedIndex(newIndex)
      e.preventDefault()
      items[newIndex] && setQueryFromItem(items[newIndex])
    }
    else if (e.key === "Enter" && items) {
      let item = items[selectedIndex]
      if (!!item.url) {
        window.open(item.url)
      } else {
        navigator.clipboard.writeText(item.text!)
      }
      // TODO process opening url or copying entity
    }
    // TODO process copying item
    // TODO mb add entropy (random)
    // TODO че должен делать escape?
  }

  return (
    <div className="App">
      <input type='text' value={query} autoFocus onKeyDownCapture={e => handleKey(e)} onChange={e => { handleInput(e.target.value) }} />
      {
        items.map((value, index) => {
          return SuggestItem({ ...value, selected: index === selectedIndex, key: index })
        })
      }
    </div>
  );
}

export default App;
