import Link from "next/link"
import Highlight, { defaultProps } from "prism-react-renderer";
import theme from "prism-react-renderer/themes/nightOwl";  
//import theme from "prism-react-renderer/themes/dracula";  


const CodeViewer = ({code = {}}) => (
  <Highlight {...defaultProps} theme={theme} code={JSON.stringify(code, undefined, 2)} language="json">
    {({ className, style, tokens, getLineProps, getTokenProps }) => (
      <pre className={className} style={style}>
        {tokens.map((line, i) => (
          <div {...getLineProps({ line, key: i })}>
            {line.map((token, key) => {
                if (token.content.startsWith('"/') || token.content.startsWith('"https://')) {
                    return(
                        <Link key={key} href={token.content.split('"').join('')} ><a><span {...getTokenProps({ token, key })} /></a></Link>
                    )
                } else {
                    return(
                        <span {...getTokenProps({ token, key })} />
                    )
                }
            })}
          </div>
        ))}
      </pre>
    )}
  </Highlight>
);

export default CodeViewer;