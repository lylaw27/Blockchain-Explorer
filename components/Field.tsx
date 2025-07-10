export const Field = ({title,content} : {title:string | number | undefined, content: string | number | undefined})=>{
    return(
        <div className="grid grid-cols-2 gap-3 justify-items-center">
            <div className="text-grey-900 font-bold text-l">{title}</div>
            <div className="text-grey-900 text-l">{content}</div>
        </div>
    )
}