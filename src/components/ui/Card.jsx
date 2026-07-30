export default function Card({ children, className = '', style, ...rest }) {
  return (
    <div className={`shq-card p-3 ${className}`} style={style} {...rest}>
      {children}
    </div>
  )
}
