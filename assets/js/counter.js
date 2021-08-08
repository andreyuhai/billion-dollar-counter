export default function toggleCounter() {
	let hideCounterElem = document.getElementById("foo")

	hideCounterElem.addEventListener("click", (e) => {
		let counterDiv = document.getElementById("counter")

		if (counterDiv.style.display == "none") {
			counterDiv.style.removeProperty("display")
			e.target.innerText = "Hide the Counter"
		} else {
			counterDiv.style.display = "none";
			e.target.innerText = "Show the Counter"
		}
	});
}

toggleCounter();
