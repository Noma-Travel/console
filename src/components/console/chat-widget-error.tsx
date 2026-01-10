export default function ChatWidgetError({ key, item }: { key: string; item: { _out: { content: string | number | any } } }) {



  return (

        <span key={key} className="flex flex-col mb-4 w-full max-w-[75%] mx-auto">
            <div className="text-xs text-center mt-0 mb-0 text-red-500/50">
            {item?._out?.content ? (
              typeof item._out.content === 'string' ? item._out.content :
              typeof item._out.content === 'number' ? item._out.content.toString() :
              JSON.stringify(item._out.content)
            ) : ''}
            </div>
        </span>   
        
  )
}
