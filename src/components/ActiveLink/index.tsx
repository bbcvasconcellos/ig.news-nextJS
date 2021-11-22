import Link, { LinkProps } from "next/link"
import { useRouter } from "next/router"
import { ReactElement, cloneElement } from "react"

//extends LinkProps diz que o ActiveLinkProps recebe tambem todas as props que Link tambem recebe
interface ActiveLinkProps extends LinkProps{
  children: ReactElement;
  activeClassName: string;
}

export const ActiveLink = ({ children, activeClassName, ...rest }: ActiveLinkProps) => {
  const { asPath } = useRouter()

  const className = asPath === rest.href ? activeClassName : ''


  /*cloneElement permite clonar um elemento e modificar props dele*/
  return(
    <Link {...rest}>
      {cloneElement(children, {
        className,
      })}
    </Link>
  )
}  