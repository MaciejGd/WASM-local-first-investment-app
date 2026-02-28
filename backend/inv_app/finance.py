"""
    File with enpoints for receiving finance data
"""

from flask import (
    Blueprint, flash, g, redirect, render_template, request, session, jsonify, Reponse
)