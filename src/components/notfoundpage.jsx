import { Link } from "react-router-dom";


function NotFoundPage() {
    return ( 
        <div className="notfound-page">
            <Link to="/">
            <img className="notfound-image" src="../assets/notfound.png" />
            <p style={{color: 'white', textAlign: "center"}}>Page not found</p>
            </Link>
        </div>
     );
}

export default NotFoundPage;
