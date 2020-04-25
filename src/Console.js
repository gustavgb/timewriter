import React, { useState, useEffect, useCallback, useRef } from 'react'
import styled from 'styled-components'
import Textarea from 'react-textarea-autosize'

const History = styled.div`
  align-items: end;
`

const Root = styled.div`
  background-color: #333;
  padding: 5rem;
  border-radius: 10px;
  width: 100rem;
  max-width: calc(100vw - 30vh);
  height: 70vh;

  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  justify-content: flex-end;

  & > ${History},
  & textarea {
    color: white;
    font-size: 2.5rem;
    line-height: 3.5rem;
    font-family: 'Courier New', Courier, monospace;

    &::selection {
      background-color: #aaa;
    }
  }
`

const Command = styled.div.attrs(props => ({
  style: {
    height: props.height + 'px'
  }
}))`
  & textarea {
    background: transparent;
    border: 0;
    outline: none;
    width: 100%;
    padding: 0;
    resize: none;
  }
`

const Console = () => {
  const [command, setCommand] = useState('')
  const [clickPosition, setClickPosition] = useState(null)
  const [inputHeight, setInputHeight] = useState(0)
  const inputRef = useRef(null)

  const focusInput = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  const registerMousePosition = useCallback((e) => {
    setClickPosition(`${e.clientX}x${e.clientY}`)
  }, [])

  const determineClick = useCallback((e) => {
    if (`${e.clientX}x${e.clientY}` === clickPosition) {
      focusInput()
    }
  }, [focusInput, clickPosition])

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  return (
    <Root onMouseDown={registerMousePosition} onMouseUp={determineClick}>
      <History>
        History line
      </History>
      <Command height={inputHeight}>
        <Textarea
          inputRef={(el) => { inputRef.current = el }}
          value={`${command}`}
          onChange={(e) => setCommand(e.target.value)}
          onHeightChange={setInputHeight}
        />
      </Command>
    </Root>
  )
}

export default Console
