export function LyricsViewer({content}:{content:string}){return <div className="lyrics-viewer">{content.split(/\r?\n/).map((line,i)=><p key={`${i}-${line}`}>{line || '\u00a0'}</p>)}</div>}
