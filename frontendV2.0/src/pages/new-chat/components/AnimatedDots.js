// tools
import React from "react"
import styled from "styled-components"

// styles
const AnimatedDots = styled.span`
  &::after {
    display: inline-block;
    animation: ellipsis 1.25s infinite;
    content: ".";
    width: 1em;
    text-align: left;
  }
  @keyframes ellipsis {
    0% {
      content: ".";
    }
    33% {
      content: "..";
    }
    66% {
      content: "...";
    }
  }
`

// return
export default props => {
  return <AnimatedDots className={props.className}>{props.children}</AnimatedDots>
}