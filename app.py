import os
from datetime import datetime
from flask import Flask, render_template, request, url_for, redirect
from flask_sqlalchemy import SQLAlchemy

from sqlalchemy.sql import func

basedir = os.path.abspath(os.path.dirname(__file__))

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///" + os.path.join(
    basedir, "database.db"
)
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db = SQLAlchemy(app)


class Blogpost(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(50))
    subtitle = db.Column(db.String(50))
    author = db.Column(db.String(20))
    content = db.Column(db.Text)
    date_posted = db.Column(db.DateTime(timezone=True), server_default=func.now())

    def __repr__(self):
        return f"<Blogpost {self.id}>"


@app.route("/")
def index():
    date = datetime.now()
    posts = Blogpost.query.order_by(Blogpost.date_posted.desc()).all()
    return render_template("index.html", posts=posts, date=date)


@app.route("/post/<int:post_id>/")
def post(post_id):
    post = Blogpost.query.get_or_404(post_id)
    return render_template("post.html", post=post)


@app.route("/create/", methods=("GET", "POST"))
def create():
    if request.method == "POST":
        title = request.form["title"]
        subtitle = request.form["subtitle"]
        author = request.form["author"]
        content = request.form["content"]
        post = Blogpost(
            title=title,
            subtitle=subtitle,
            author=author,
            content=content,
            date_posted=datetime.now(),
        )

        db.session.add(post)
        db.session.commit()

        return redirect(url_for("index"))

    return render_template("create.html")


@app.route("/edit/<int:post_id>/", methods=("GET", "POST"))
def edit(post_id):
    post = Blogpost.query.get_or_404(post_id)

    if request.method == "POST":
        title = request.form["title"]
        subtitle = request.form["subtitle"]
        author = request.form["author"]
        content = request.form["content"]

        post.title = title
        post.subtitle = subtitle
        post.author = author
        post.content = content

        db.session.add(post)
        db.session.commit()

        return redirect(url_for("index"))

    return render_template("edit.html", post=post)


@app.post("/delete/<int:post_id>/")
def delete(post_id):
    post = Blogpost.query.get_or_404(post_id)
    db.session.delete(post)
    db.session.commit()
    return redirect(url_for("index"))


if __name__ == "__main__":
    app.run(debug=True)
