/* eslint-disable @typescript-eslint/no-explicit-any */
import { KeyboardEvent, useEffect, useRef, useState } from 'react';
import './App.css';
import { Base64 } from 'js-base64';


interface SuggestItemPropsApi {
  text: string,
  description: string | undefined
};
interface SuggestItemProps extends SuggestItemPropsApi {
  selected: boolean | undefined,
  key: any
}

function isUrl(s: string) {
  return (s.startsWith("http://") || s.startsWith("https://")) && !s.includes(" ")
}

function SuggestItem(props: SuggestItemProps) {
  let classes = `suggest_item ${props.selected === true ? "selected" : ""}`

  let isLink = isUrl(props.text)
  // let icon = (isLink ? "🔗" : "📋")

  return (
    <div className={classes} key={props.key}>
      <p>
        <span>
          {/* {icon}  */}
          {
          isLink
            ?
            <a href={props.text}>{props.description || props.text}</a>
            :
            props.text
        }</span>
      </p>
    </div>
  )
}

const HOST = process.env.NODE_ENV === "production" ? "" : "http://127.0.0.1:9090"

async function calcInitialQuery() {
  const urlParams = new URLSearchParams(window.location.search);
  return navigator.clipboard.readText()
    .then((value) => {
      return value
    })
    .catch(() => {
      return Base64.decode(urlParams.get('clipboard')!.replace("-", "+").replace("_", "/").replace(".", "="))
    }
  ).then((value) => {
    if (!!value) {
      return value.replace("\n", " ")
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
    setQuery(item.text)
  }
  const textInput = useRef<HTMLInputElement>(null);

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
        // let newItems = [{ text: newQuery } as SuggestItemPropsApi].concat(data);
        let newItems = data;
        // if (!data.length) newItems = []
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
      if (isUrl(item.text)) {
        window.open(item.text)
      } else {
        navigator.clipboard.writeText(item.text!)
        fetch(HOST + "/paste")
      }
    }
  }

  return (
    <div className="App">

      <div className='query'>
        <p className='queryP'>
          {/* <span className='abc'>📋</span> */}
          <input ref={textInput}
          onBlur={() => {textInput.current?.focus()}}
          type='text' value={query} autoFocus onKeyDownCapture={e => handleKey(e)} onChange={e => { handleInput(e.target.value) }} />
        </p>
      </div>

      {
        items.map((value, index) => {
          return SuggestItem({ ...value, selected: index === selectedIndex, key: index })
        })
      }
    </div>
  );
}

export default App;
