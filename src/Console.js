import React, { useState, useEffect, useCallback, useRef } from 'react'
import styled from 'styled-components'
import Textarea from 'react-textarea-autosize'

const History = styled.div`
  & > div {
    width: 100%;
    word-break: break-all;
  }
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

  overflow: hidden;

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

const Console = ({
  history,
  onCommand
}) => {
  const [command, setCommand] = useState('')
  const [clickPosition, setClickPosition] = useState(null)
  const [inputHeight, setInputHeight] = useState(0)
  const [prevCommands, setPrevCommands] = useState([])
  const [prevCommandPointer, setPrevCommandPointer] = useState(-1)
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

  const handleChange = useCallback(value => {
    setCommand(value)
    if (prevCommandPointer !== -1) {
      setPrevCommandPointer(-1)
    }
  }, [prevCommandPointer])

  const handleKey = useCallback((e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      const value = prevCommandPointer !== -1 ? prevCommands[prevCommandPointer] : command
      onCommand(value)
      setPrevCommands([value].concat(prevCommands))
      handleChange('')
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      const nextPointer = prevCommandPointer + 1
      if (nextPointer >= prevCommands.length) {
        return
      }
      setPrevCommandPointer(nextPointer)
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      const nextPointer = prevCommandPointer - 1
      if (nextPointer < -1) {
        return
      }
      setPrevCommandPointer(nextPointer)
    }
  }, [command, onCommand, prevCommands, prevCommandPointer, handleChange])

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  const value = prevCommandPointer !== -1 ? prevCommands[prevCommandPointer] : command

  return (
    <Root onMouseDown={registerMousePosition} onMouseUp={determineClick}>
      <History>
        {history.map((line, index) => (
          <div key={index} dangerouslySetInnerHTML={{ __html: line }} />
        ))}
      </History>
      <Command height={inputHeight}>
        <Textarea
          inputRef={(el) => { inputRef.current = el }}
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          onHeightChange={setInputHeight}
          onKeyDown={handleKey}
        />
      </Command>
    </Root>
  )
}

export default Console
