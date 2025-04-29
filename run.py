#from src import app
from src import app
#from flask.cli import FlaskGroup

#cli = FlaskGroup(app)
#app = create_app()

if __name__ == '__main__':
    try:
        app.run(debug=True, ssl_context=("cert.pem", "key.pem"))
    except:
        print("Failed using ssh.")
        app.run(debug=True)

    #"--cert=(cert.pem,key.pem)"