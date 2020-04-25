import React, { useState, useEffect, useCallback } from 'react'
import styled from 'styled-components'

const Root = styled.div`
  background-color: #333;
  padding: 5rem;
  border-radius: 10px;
  width: 100rem;
  max-width: calc(100vw - 30vh);
  height: 70vh;

  & > * {
    color: white;
    font-size: 2.5rem;
    line-height: 3.5rem;
    font-family: 'Courier New', Courier, monospace;

    &::selection {
      background-color: #aaa;
    }
  }
`

const History = styled.div`
`

const Command = styled.input`
  height: 3.5rem;
  background: transparent;
  border: 0;
  outline: none;
  cursor: default;
`

const Console = () => {
  const [command, setCommand] = useState('')
  const inputRef = React.createRef()

  const onClickRoot = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [inputRef])

  useEffect(() => {
    onClickRoot()
  }, [onClickRoot])

  return (
    <Root>
      <Command
        value={command}
        onChange={(e) => setCommand(e.target.value)}
        ref={inputRef}
      />
      <History>
        History line
      </History>
    </Root>
  )
}

export default Console
